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

        String subIndent = indent(new StringBuilder(), indent + 1).toString();
        b.append(
                statements.stream()
                        .map(s -> subIndent + s.charSequence(0))
                        .collect(Collectors.joining(",\n"))
        );

        indent(b, indent).append("])");
        return b;
    }
}
