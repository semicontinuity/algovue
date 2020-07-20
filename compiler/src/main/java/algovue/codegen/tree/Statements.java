package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;

public class Statements extends Statement {

    private List<Statement> statements = new ArrayList<>();

    public static Statements builder() {
        return new Statements();
    }

    public Statements statement(Statement s) {
        this.statements.add(s);
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.sequenceStatement([\n");
        for (Statement statement : statements) {
            indent(b, indent + 1).append(statement.charSequence(0));
        }
        indent(b, indent).append("])");
        return b;
    }
}
