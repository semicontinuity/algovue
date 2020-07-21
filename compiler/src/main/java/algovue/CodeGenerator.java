package algovue;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

import algovue.codegen.tree.ArrayElementRead;
import algovue.codegen.tree.ArrayElementWrite;
import algovue.codegen.tree.ArrayLiteral;
import algovue.codegen.tree.Assignment;
import algovue.codegen.tree.BinaryExpression;
import algovue.codegen.tree.Declarations;
import algovue.codegen.tree.Expression;
import algovue.codegen.tree.ExpressionStatement;
import algovue.codegen.tree.FunctionCall;
import algovue.codegen.tree.FunctionDeclaration;
import algovue.codegen.tree.IfStatement;
import algovue.codegen.tree.Number;
import algovue.codegen.tree.ReturnStatement;
import algovue.codegen.tree.Statement;
import algovue.codegen.tree.Statements;
import algovue.codegen.tree.VarRead;
import algovue.codegen.tree.VarWrite;
import algovue.codegen.tree.WhileStatement;
import com.sun.source.tree.CompilationUnitTree;
import com.sun.source.util.JavacTask;
import com.sun.tools.javac.tree.JCTree;


public class CodeGenerator {

    Declarations declarations = Declarations.builder();
    Assignment usage;


    public static void main(String[] args) throws IOException {
        final JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

        final DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        final StandardJavaFileManager manager = compiler.getStandardFileManager(
                diagnostics, null, null);

        String fileName = args[0];
        final File file = new File(fileName);

        final Iterable<? extends JavaFileObject> sources =
                manager.getJavaFileObjectsFromFiles(Collections.singletonList(file));

        final JavacTask task = (JavacTask) compiler.getTask(null, manager, diagnostics,
                null, null, sources);

        CodeGenerator codeGenerator = new CodeGenerator();
        codeGenerator.generateFrom(task);
        codeGenerator.printProgram();
    }

    private void printProgram() {
        System.out.println("test = function() {");
        System.out.println();
        System.out.println(declarations);
        System.out.println("const usage = " + usage.charSequence(0) + ";");
        System.out.println();
        System.out.println("return {");

        List<String> names = declarations.names();
        names.add("usage");
        System.out.println("    code: vm.codeBlocks([" + String.join(", ", names) + "]),");
        System.out.println("    entry: usage");
        System.out.println("};");
        System.out.println("}();");
    }

    private void generateFrom(JavacTask task) throws IOException {
        Iterable<? extends CompilationUnitTree> asts = task.parse();
        task.analyze();

        for (CompilationUnitTree ast : asts) {
            generateFrom((JCTree.JCCompilationUnit) ast);
        }
    }

    private void generateFrom(JCTree.JCCompilationUnit u) {
        for (JCTree def : u.defs) {
            if (def.getTag() == JCTree.Tag.CLASSDEF) {
                generateFrom((JCTree.JCClassDecl) def);
            }
        }
    }

    private void generateFrom(JCTree.JCClassDecl e) {
        for (JCTree def : e.defs) {
            if (def.getTag() == JCTree.Tag.METHODDEF) {
                generateFrom((JCTree.JCMethodDecl) def);
            } else if (def.getTag() == JCTree.Tag.VARDEF) {
                usage = generateFrom((JCTree.JCVariableDecl) def);
            }
        }
    }

    private Assignment generateFrom(JCTree.JCVariableDecl e) {
        return Assignment.builder().left(e.name.toString()).right(generateFrom(e.init));
    }

    private void generateFrom(JCTree.JCMethodDecl e) {
        if ("<init>".equals(e.getName().toString())) {
            return;
        }

        declarations.declaration(
                FunctionDeclaration.builder()
                        .name(e.getName().toString())
                        .params(e.getParameters().stream().map(p -> p.name.toString()).collect(Collectors.toList()))
                        .body(generateFrom(e.body))
        );
    }

    private Statements generateFrom(JCTree.JCBlock e) {
        Statements result = Statements.builder();
        for (JCTree def : e.stats) {
            result.statement(generateFrom((JCTree.JCStatement) def));
        }
        return result;
    }

    private Statement generateFrom(JCTree.JCStatement def) {
        if (def instanceof JCTree.JCReturn) {
            return generateFrom((JCTree.JCReturn) def);
        } else if (def instanceof JCTree.JCVariableDecl) {
            return generateFrom((JCTree.JCVariableDecl) def);
        } else if (def instanceof JCTree.JCExpressionStatement) {
            return generateFrom((JCTree.JCExpressionStatement) def);
        } else if (def instanceof JCTree.JCIf) {
            return generateFrom((JCTree.JCIf) def);
        } else if (def instanceof JCTree.JCWhileLoop) {
            return generateFrom((JCTree.JCWhileLoop) def);
        } else if (def instanceof JCTree.JCBlock) {
            return generateFrom((JCTree.JCBlock) def);
        } else {
            throw new IllegalArgumentException(def.getClass().getName());
        }
    }

    private IfStatement generateFrom(JCTree.JCIf e) {
        IfStatement result = IfStatement.builder()
                .expression(generateFrom(unparen(e.cond)))
                .ifStatement(generateFrom(e.thenpart));
        if (e.elsepart != null) {
            result.elseStatement(generateFrom(e.elsepart));
        }
        return result;
    }

    private WhileStatement generateFrom(JCTree.JCWhileLoop e) {
        return WhileStatement.builder()
                .expression(generateFrom(unparen(e.cond)))
                .body(generateFrom(e.body));
    }

    private JCTree.JCExpression unparen(JCTree.JCExpression cond) {
        return ((JCTree.JCParens) cond).expr;
    }

    private ExpressionStatement generateFrom(JCTree.JCExpressionStatement e) {
        if (e.expr instanceof JCTree.JCAssign) {
            return generateFromJCAssign((JCTree.JCAssign) e.expr);
        } else if (e.expr instanceof JCTree.JCMethodInvocation) {
            return generateFromJCMethodInvocation((JCTree.JCMethodInvocation) e.expr);
        } else {
            throw new IllegalArgumentException(e.expr.getClass().getName());
        }
    }

    private ExpressionStatement generateFromJCMethodInvocation(JCTree.JCMethodInvocation e) {
        return ExpressionStatement.builder().right(generateFrom(e));
    }

    private ExpressionStatement generateFromJCAssign(JCTree.JCAssign assign) {
        return ExpressionStatement.builder().left(lvalue(assign.lhs)).right(generateFrom(assign.rhs));
    }

    private Expression lvalue(JCTree.JCExpression lhs) {
        Expression left;
        if (lhs instanceof JCTree.JCArrayAccess) {
            left = generateFrom((JCTree.JCArrayAccess) lhs, true);
        } else if (lhs instanceof JCTree.JCIdent) {
            left = generateFrom((JCTree.JCIdent) lhs, true);
        } else {
            throw new IllegalArgumentException(lhs.getClass().getName());
        }
        return left;
    }

    private ReturnStatement generateFrom(JCTree.JCReturn e) {
        return ReturnStatement.builder().expression(generateFrom(e.expr));
    }

    private Expression generateFrom(JCTree.JCExpression e) {
        if (e instanceof JCTree.JCLiteral) {
            return generateFrom((JCTree.JCLiteral) e);
        } else if (e instanceof JCTree.JCBinary) {
            return generateFrom((JCTree.JCBinary) e);
        } else if (e instanceof JCTree.JCIdent) {
            return generateFrom((JCTree.JCIdent) e, false);
        } else if (e instanceof JCTree.JCMethodInvocation) {
            return generateFrom((JCTree.JCMethodInvocation) e);
        } else if (e instanceof JCTree.JCNewArray) {
            return generateFrom((JCTree.JCNewArray) e);
        } else if (e instanceof JCTree.JCArrayAccess) {
            return generateFrom((JCTree.JCArrayAccess) e, false);
        } else if (e instanceof JCTree.JCNewClass) {
            return generateFrom((JCTree.JCNewClass) e);
        } else {
            throw new IllegalArgumentException(e.getClass().getName());
        }
    }

    private Expression generateFrom(JCTree.JCNewClass e) {
        return ArrayLiteral.builder();
    }

    private Expression generateFrom(JCTree.JCMethodInvocation e) {
        JCTree.JCExpression meth = e.meth;
        String self = null;
        String name;
        if (meth instanceof JCTree.JCFieldAccess) {
            self = ((JCTree.JCFieldAccess) meth).selected.toString();
//            name = ((JCTree.JCFieldAccess) meth).name.toString();
            name = "push";
        } else {
            name = meth.toString();
        }
        return FunctionCall.builder()
                .self(self)
                .name(name)
                .params(e.args.stream().map(this::generateFrom).collect(Collectors.toList()));
    }

    private Expression generateFrom(JCTree.JCArrayAccess e, boolean write) {
        return write
                ? ArrayElementWrite.builder().name(e.indexed.toString()).index(generateFrom(e.index))
                : new ArrayElementRead(e.indexed.toString(), generateFrom(e.index));
    }

    private Expression generateFrom(JCTree.JCNewArray e) {
        return ArrayLiteral.builder().params(e.elems.stream().map(this::generateFrom).collect(Collectors.toList()));
    }

    private Expression generateFrom(JCTree.JCIdent e, boolean write) {
        return write ? VarWrite.builder().name(e.name.toString()) : new VarRead(e.name.toString());
    }

    private Expression generateFrom(JCTree.JCLiteral e) {
        return new Number((Integer) e.value);
    }

    private BinaryExpression generateFrom(JCTree.JCBinary e) {
        return BinaryExpression.builder()
                .functor(e.getTag().toString().toLowerCase())
                .left(generateFrom(e.lhs))
                .right(generateFrom(e.rhs));
    }
}
