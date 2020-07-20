package algovue;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

import algovue.codegen.tree.Declarations;
import algovue.codegen.tree.FunctionDeclaration;
import algovue.codegen.tree.Statements;
import com.sun.source.tree.CompilationUnitTree;
import com.sun.source.util.JavacTask;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.util.List;


public class CodeGenerator {

    Declarations declarations = Declarations.builder();


    public static void main(String[] args) throws IOException {
        final JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

        final DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        final StandardJavaFileManager manager = compiler.getStandardFileManager(
                diagnostics, null, null);

        String fileName = args[0];
        final File file = new File(fileName);

        final Iterable<? extends JavaFileObject> sources =
                manager.getJavaFileObjectsFromFiles(Collections.singletonList(file));

        final JavacTask task = (JavacTask) compiler.getTask( null, manager, diagnostics,
                null, null, sources );

        CodeGenerator codeGenerator = new CodeGenerator();
        codeGenerator.generateFrom(task);
        System.out.println(codeGenerator.declarations);
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
            }
        }
    }

    private void generateFrom(JCTree.JCMethodDecl e) {
        if ("<init>".equals(e.getName().toString())) return;

        JCTree returnType = e.getReturnType();
        if (returnType.getTag() != JCTree.Tag.TYPEIDENT) return;

        declarations.declaration(
                FunctionDeclaration.builder()
                        .name(e.getName().toString())
                        .params(e.getParameters().stream().map(p -> p.name.toString()).collect(Collectors.toList()))
                        .body(Statements.builder())
        );
    }
}
