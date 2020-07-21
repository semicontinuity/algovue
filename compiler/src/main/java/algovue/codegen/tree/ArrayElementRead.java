package algovue.codegen.tree;

public class ArrayElementRead extends Expression {

    final String name;
    final Expression index;

    public ArrayElementRead(String name, Expression index) {
        this.name = name;
        this.index = index;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.arrItem('" + name + "', " + index.charSequence(0) + ")";
    }
}
