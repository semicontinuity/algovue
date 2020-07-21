package algovue.codegen.tree;

public class VarRead extends Expression {

    final String name;

    public VarRead(String name) {
        this.name = name;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.variable('" + name + "')";
    }
}
