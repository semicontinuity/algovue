package algovue;

import java.io.File;
import java.io.IOException;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

import algovue.codegen.tree.ArrayElementRead;
import algovue.codegen.tree.ArrayElementWrite;
import algovue.codegen.tree.ArrayLiteral;
import algovue.codegen.tree.BinaryExpression;
import algovue.codegen.tree.Bool;
import algovue.codegen.tree.BreakStatement;
import algovue.codegen.tree.Char;
import algovue.codegen.tree.ContinueStatement;
import algovue.codegen.tree.Declarations;
import algovue.codegen.tree.DoWhileStatement;
import algovue.codegen.tree.EolComment;
import algovue.codegen.tree.Expression;
import algovue.codegen.tree.ExpressionStatement;
import algovue.codegen.tree.FunctionCall;
import algovue.codegen.tree.FunctionDeclaration;
import algovue.codegen.tree.Group;
import algovue.codegen.tree.IfStatement;
import algovue.codegen.tree.NewIntArray;
import algovue.codegen.tree.Null;
import algovue.codegen.tree.Number;
import algovue.codegen.tree.ReturnStatement;
import algovue.codegen.tree.StandAloneComment;
import algovue.codegen.tree.Statement;
import algovue.codegen.tree.Statements;
import algovue.codegen.tree.Stop;
import algovue.codegen.tree.StringLiteral;
import algovue.codegen.tree.UnaryExpression;
import algovue.codegen.tree.VarPostOp;
import algovue.codegen.tree.VarRead;
import algovue.codegen.tree.VarWrite;
import algovue.codegen.tree.WhileStatement;
import com.sun.source.tree.CompilationUnitTree;
import com.sun.source.util.JavacTask;
import com.sun.tools.javac.code.Attribute;
import com.sun.tools.javac.code.Symbol;
import com.sun.tools.javac.code.TypeTag;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.util.Pair;


public class CodeGenerator {

    Declarations declarations = Declarations.builder();
    Statements usage = Statements.builder();


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
        if (usage == null) throw new IllegalArgumentException("No usage");
        usage.statement(new Stop());
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
                usage.statement(generateFrom((JCTree.JCVariableDecl) def));
            }
        }
    }

    private Statement generateFrom(JCTree.JCVariableDecl e) {
        String name = e.name.toString();
        AbstractMap.SimpleEntry<List<String>, String> anns = annotationValues(e.mods);

        List<String> targetArrays = null;
        Map<String, Object> metaData = null;
        if (anns != null) {
            if (anns.getValue() == null) {
                targetArrays = anns.getKey();
                metaData = new HashMap<>();
                metaData.put("role", "index");
                metaData.put("targetArrays", targetArrays);
            } else if (anns.getKey() != null && anns.getKey().size() >= 1 && anns.getKey().size() <= 2) {
                List<String> pointers = anns.getKey();
                metaData = new HashMap<>();
                String indexFrom = pointers.get(0);
                if (pointers.size() == 2) {
                    metaData.put("rangeFromVar", indexFrom);
                    metaData.put("rangeToVar", pointers.get(1));
                    metaData.put("targetArray", anns.getValue());
                    metaData.put("role", "arrayWindow");
                } else {
                    metaData.put("indexVar", indexFrom);
                    metaData.put("targetArray", anns.getValue());
                    metaData.put("role", "arrayRangeAggregate");
                }
            }
        }
        VarWrite varWrite = generateVarWrite(name)
                .metaData(metaData);
        return ExpressionStatement.builder()
                .left(varWrite)
                .right(generateFrom(e.init));
    }


    // assume @Generated
    private AbstractMap.SimpleEntry<List<String>, String> annotationValues(JCTree.JCModifiers mods) {
        String s = null;
        ArrayList<String> result = new ArrayList<>();
        for (JCTree.JCAnnotation annotation : mods.annotations) {
            for (Pair<Symbol.MethodSymbol, Attribute> value : annotation.attribute.values) {
                Attribute snd = value.snd;
                if (snd.type.getTag() == TypeTag.ARRAY) {
                    for (Object o : (com.sun.tools.javac.util.List) snd.getValue()) {
                        Attribute.Constant o1 = (Attribute.Constant) o;
                        result.add((String) o1.value);
                    }
                } else {
                    s = (String) snd.getValue();
                }
            }
        }
        return s == null && result.isEmpty() ? null : new AbstractMap.SimpleEntry<>(result, s);
    }

    private void generateFrom(JCTree.JCMethodDecl e) {
        if ("<init>".equals(e.getName().toString())) {
            return;
        }

        declarations.declaration(
                FunctionDeclaration.builder()
                        .comment(commentText(annotationValues(e.mods)))
                        .name(e.getName().toString())
                        .params(e.getParameters().stream().map(p -> p.name.toString()).collect(Collectors.toList()))
                        .body(generateFrom(e.body))
        );
    }

    private Statements generateFrom(JCTree.JCBlock e) {
        Statements result = Statements.builder();
        EolComment eolComment = null;
        Group group = null;
        for (JCTree def : e.stats) {
            Statement statement = generateFrom((JCTree.JCStatement) def);
            if (statement == null) { // group terminator
                result.statement(group);
                group = null;
                eolComment = null;
            } else if (statement instanceof Group) {
                group = (Group) statement;
                eolComment = null;
            } else if (statement instanceof EolComment) {
                eolComment = (EolComment) statement;
            } else {
                statement.setEolComment(eolComment);
                eolComment = null;
                if (group != null) {
                    group.statement(statement);
                } else {
                    result.statement(statement);
                }
            }
        }
        if (group != null) {
            // unterminated group
            result.statement(group);
        }
        return result;
    }

    private Statement generateFrom(JCTree.JCStatement def) {
        if (def instanceof JCTree.JCVariableDecl) {
            JCTree.JCVariableDecl e = (JCTree.JCVariableDecl) def;
            String name = e.name.toString();
            AbstractMap.SimpleEntry<List<String>, String> anns = annotationValues(e.mods);

            if (name.startsWith("$")) {
                if (anns == null)   // $-var without annotation: group terminator
                    return null;
                else
                    return Group.builder()
                        .header(commentText(anns))
                        .inactiveColor(anns.getKey().size() > 0 ? anns.getKey().get(0) : null)
                        .activeColor(anns.getKey().size() > 1 ? anns.getKey().get(1) : null);
            } else if (name.startsWith("_")) {
                if (anns != null) {
                    if (anns.getValue() == null)
                        return new StandAloneComment(commentText(anns));
                    else
                        return new EolComment(" // " + anns.getValue());
                }
                return new StandAloneComment(null); // line break
            } else {
                return generateFrom(e);
            }
        } else if (def instanceof JCTree.JCReturn) {
            return generateFrom((JCTree.JCReturn) def);
        } else if (def instanceof JCTree.JCBreak) {
            return generateFrom((JCTree.JCBreak) def);
        } else if (def instanceof JCTree.JCContinue) {
            return generateFrom((JCTree.JCContinue) def);
        } else if (def instanceof JCTree.JCExpressionStatement) {
            return generateFrom((JCTree.JCExpressionStatement) def);
        } else if (def instanceof JCTree.JCIf) {
            return generateFrom((JCTree.JCIf) def);
        } else if (def instanceof JCTree.JCWhileLoop) {
            return generateFrom((JCTree.JCWhileLoop) def);
        } else if (def instanceof JCTree.JCDoWhileLoop) {
            return generateFrom((JCTree.JCDoWhileLoop) def);
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

    private DoWhileStatement generateFrom(JCTree.JCDoWhileLoop e) {
        return DoWhileStatement.builder()
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
        } else if (e.expr instanceof JCTree.JCUnary) {
            return ExpressionStatement.builder().right(generateFrom((JCTree.JCUnary) e.expr));
        } else {
            throw new IllegalArgumentException(e.expr.getClass().getName());
        }
    }

    private ExpressionStatement generateFromJCMethodInvocation(JCTree.JCMethodInvocation e) {
        return ExpressionStatement.builder().right(generateFrom(e));
    }

    private ExpressionStatement generateFromJCAssign(JCTree.JCAssign assign) {
        return generateAssignment(assign.lhs, assign.rhs);
    }

    private ExpressionStatement generateAssignment(JCTree.JCExpression lhs, JCTree.JCExpression rhs) {
        return ExpressionStatement.builder().left(lvalue(lhs)).right(generateFrom(rhs));
    }

    private Expression lvalue(JCTree.JCExpression lhs) {
        Expression left;
        if (lhs instanceof JCTree.JCArrayAccess) {
            left = generateFrom((JCTree.JCArrayAccess) lhs, true);
        } else if (lhs instanceof JCTree.JCIdent) {
            left = generateVarWrite(((JCTree.JCIdent) lhs).name.toString());
        } else {
            throw new IllegalArgumentException(lhs.getClass().getName());
        }
        return left;
    }

    private ReturnStatement generateFrom(JCTree.JCReturn e) {
        return ReturnStatement.builder().expression(generateFrom(e.expr));
    }

    private BreakStatement generateFrom(JCTree.JCBreak e) {
        return BreakStatement.builder();
    }

    private ContinueStatement generateFrom(JCTree.JCContinue e) {
        return ContinueStatement.builder();
    }

    private Expression generateFrom(JCTree.JCExpression e) {
        if (e instanceof JCTree.JCLiteral) {
            return generateFrom((JCTree.JCLiteral) e);
        } else if (e instanceof JCTree.JCBinary) {
            return generateFrom((JCTree.JCBinary) e);
        } else if (e instanceof JCTree.JCIdent) {
            return generateVarRead((JCTree.JCIdent) e);
        } else if (e instanceof JCTree.JCFieldAccess) {
            return generateFrom((JCTree.JCFieldAccess) e);
        } else if (e instanceof JCTree.JCMethodInvocation) {
            return generateFrom((JCTree.JCMethodInvocation) e);
        } else if (e instanceof JCTree.JCNewArray) {
            return generateFrom((JCTree.JCNewArray) e);
        } else if (e instanceof JCTree.JCArrayAccess) {
            return generateFrom((JCTree.JCArrayAccess) e, false);
        } else if (e instanceof JCTree.JCNewClass) {
            return generateFrom((JCTree.JCNewClass) e);
        } else if (e instanceof JCTree.JCUnary) {
            return generateFrom((JCTree.JCUnary) e);
        } else {
            throw new IllegalArgumentException(e.getClass().getName());
        }
    }

    private Expression generateFrom(JCTree.JCNewClass e) {
        return ArrayLiteral.builder();
    }

    private Expression generateFrom(JCTree.JCFieldAccess e) {
        String self = e.selected.toString();
        String name = e.name.toString();
        if (!"length".equals(name)) throw new IllegalArgumentException(name);

        return FunctionCall.builder()
                .self(self)
                .name(name);
    }

    private Expression generateFrom(JCTree.JCMethodInvocation e) {
        JCTree.JCExpression meth = e.meth;
        String self = null;
        String name;
        if (meth instanceof JCTree.JCFieldAccess) {
            self = ((JCTree.JCFieldAccess) meth).selected.toString();
            name = ((JCTree.JCFieldAccess) meth).name.toString();
            switch (name) {
                case "append":
                case "addLast":
                case "push":
                    name = "push";
                    break;
                case "addFirst":
                    name = "unshift";
                    break;
                case "getLast":
                    return new ArrayElementRead(
                            self,
                            BinaryExpression.builder()
                                    .left(
                                            FunctionCall.builder()
                                                    .self(self)
                                                    .name("length")
                                    )
                                    .functor("minus")
                                    .right(new Number(1))
                    );
                case "getFirst":
                    return new ArrayElementRead(self, new Number(0));
                case "removeLast":
                    name = "pop";
                    break;
                case "removeFirst":
                    name = "shift";
                    break;
                case "charAt":
                    return new ArrayElementRead(self, generateFrom(e.args.last()));
            }
        } else {
            name = meth.toString(); // e.g. length() ?
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
        if (e.elems != null) {
            return ArrayLiteral.builder().params(e.elems.stream().map(this::generateFrom).collect(Collectors.toList()));
        } else {
            JCTree.JCExpression sizeExpr = e.dims.get(0);
            if (sizeExpr instanceof JCTree.JCLiteral) {
                JCTree.JCLiteral sizeLiteral = (JCTree.JCLiteral) sizeExpr;
                Integer size = (Integer) sizeLiteral.value;
                return ArrayLiteral.builder().params(
                        IntStream.range(0, size).mapToObj(i -> new Number(0)).collect(Collectors.toList())
                );
            } else {
                // new int[expr]
                return new NewIntArray(generateFrom(sizeExpr));
            }
        }
    }

    private Expression generateVarRead(JCTree.JCIdent e) {
        return new VarRead(e.name.toString());
    }

    private VarWrite generateVarWrite(String name) {
        return VarWrite.builder().name(name);
    }

    private Expression generateFrom(JCTree.JCUnary e) {
        if (e.getTag() == JCTree.Tag.POSTINC)
            return VarPostOp.builder().name(e.arg.toString()).increment(true);
        else if (e.getTag() == JCTree.Tag.POSTDEC)
            return VarPostOp.builder().name(e.arg.toString()).increment(false);
        else if (e.getTag() == JCTree.Tag.NOT)
            return new UnaryExpression(generateFrom(e.getExpression()));
        else
            throw new IllegalArgumentException(e.toString());
    }

    private Expression generateFrom(JCTree.JCLiteral e) {
        if (e.typetag == TypeTag.CHAR) {
            Integer value = (Integer) e.value;
            return new Char((char) (int) value);
        } else if (e.typetag == TypeTag.INT) {
            Integer value = (Integer) e.value;
            return new Number(value);
        } else if (e.typetag == TypeTag.BOOLEAN) {
            Integer value = (Integer) e.value;
            return new Bool(value != 0);
        } else if (e.typetag == TypeTag.CLASS) {    // must be String
            String value = (String) e.value;
            return StringLiteral.builder().value(value);
        } else if (e.typetag == TypeTag.BOT) {
            return new Null();
        } else {
            throw new IllegalArgumentException(e.toString());
        }
    }

    private BinaryExpression generateFrom(JCTree.JCBinary e) {
        return BinaryExpression.builder()
                .functor(e.getTag().toString().toLowerCase())
                .left(generateFrom(e.lhs))
                .right(generateFrom(e.rhs));
    }

    private static String commentText(AbstractMap.SimpleEntry<List<String>, String> generatedAnn) {
        String text = null;
        if (generatedAnn != null) {
            if (generatedAnn.getValue() != null) {
                text = generatedAnn.getValue();
            } else {
                if (generatedAnn.getKey().size() == 1) {
                    text = generatedAnn.getKey().get(0);
                }
            }
        }
        return text == null ? null : "// " + text;
    }
}
