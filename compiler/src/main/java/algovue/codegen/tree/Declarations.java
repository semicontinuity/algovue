package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;

public class Declarations {

    private List<Declaration> declarations = new ArrayList<>();

    public static Declarations builder() {
        return new Declarations();
    }

    public Declarations declaration(Declaration d) {
        this.declarations.add(d);
        return this;
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
