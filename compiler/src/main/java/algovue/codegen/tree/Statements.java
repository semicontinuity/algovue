package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Collectors;

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

        for (int i = 0; i < statements.size(); i++) {
            Statement statement = statements.get(i);
            b.append(statement.charSequence(indent + 1));
            if (i < statements.size() - 1) {
                b.append(",");
            }
            b.append("\n");
        }
        indent(b, indent).append("])");
        return b;
    }
}
