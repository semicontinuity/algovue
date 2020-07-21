package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;
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
        indent(b, indent + 1).append(statements.stream().map(s -> s.charSequence(0)).collect(Collectors.joining(",\n")));
        indent(b, indent).append("])");
        return b;
    }
}
