package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;

public class Group extends Statement {

    private String header;
    private String inactiveColor;
    private String activeColor;
    private List<Statement> statements = new ArrayList<>();

    public static Group builder() {
        return new Group();
    }

    public Group statement(Statement s) {
        this.statements.add(s);
        return this;
    }

    public Group header(String s) {
        this.header = s;
        return this;
    }
    public Group inactiveColor(String s) {
        this.inactiveColor = s;
        return this;
    }
    public Group activeColor(String s) {
        this.activeColor = s;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.group(");
        b.append(jsString(header)).append(",")
                .append(jsString(inactiveColor)).append(", ")
                .append(jsString(activeColor)).append(",\n");

        indent(b, indent).append("[").append('\n');
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
