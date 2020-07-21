package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Declarations {

    private List<Declaration> declarations = new ArrayList<>();

    public static Declarations builder() {
        return new Declarations();
    }

    public Declarations declaration(Declaration d) {
        this.declarations.add(d);
        return this;
    }

    public List<String> names() {
        return declarations.stream().map(d -> d.name).collect(Collectors.toList());
    }

    @Override
    public String toString() {
        StringBuilder b = new StringBuilder();
        for (Declaration declaration : declarations) {
            b.append(declaration.toString()).append("\n");
        }
        return b.toString();
    }
}
