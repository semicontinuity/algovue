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

import algovue.codegen.tree.ArrayLiteral;
import algovue.codegen.tree.Assignment;
import algovue.codegen.tree.BinaryExpression;
import algovue.codegen.tree.Declarations;
import algovue.codegen.tree.Expression;
import algovue.codegen.tree.FunctionCall;
import algovue.codegen.tree.FunctionDeclaration;
import algovue.codegen.tree.Number;
import algovue.codegen.tree.ReturnStatement;
import algovue.codegen.tree.Statements;
import algovue.codegen.tree.VarRead;
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

        JCTree returnType = e.getReturnType();
        if (returnType.getTag() != JCTree.Tag.TYPEIDENT) {
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
            if (def instanceof JCTree.JCReturn) {
                result.statement(generateFrom((JCTree.JCReturn) def));
            }
        }
        return result;
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
            return generateFrom((JCTree.JCIdent) e);
        } else if (e instanceof JCTree.JCMethodInvocation) {
            return generateFrom((JCTree.JCMethodInvocation) e);
        } else if (e instanceof JCTree.JCNewArray) {
            return generateFrom((JCTree.JCNewArray) e);
        } else {
            throw new IllegalArgumentException(e.getClass().getName());
        }
    }

    private Expression generateFrom(JCTree.JCMethodInvocation e) {
        return FunctionCall.builder()
                .name(e.meth.toString())
                .params(e.args.stream().map(this::generateFrom).collect(Collectors.toList()))
                ;
    }

    private Expression generateFrom(JCTree.JCNewArray e) {
        return ArrayLiteral.builder().params(e.elems.stream().map(this::generateFrom).collect(Collectors.toList()));
    }

    private Expression generateFrom(JCTree.JCIdent e) {
        return new VarRead(e.name.toString());
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
