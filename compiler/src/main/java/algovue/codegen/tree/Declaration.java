package algovue.codegen.tree;

public abstract class Declaration implements Node {
    protected String name;

    public abstract CharSequence charSequence(int indent);

    @Override
    public String toString() {
        return "const " + name + " = " + charSequence(1) + ';';
    }
}
