package algovue.codegen.tree;

public class VariableDeclaration extends Statement {
    private final String name;
    private final ExpressionStatement expression;

    public VariableDeclaration(String name, ExpressionStatement expression) {
        this.name = name;
        this.expression = expression;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.variableDeclaration('").append(name).append("')\n");

        b.append(expression.charSequence(indent));
        return b;
    }
}
