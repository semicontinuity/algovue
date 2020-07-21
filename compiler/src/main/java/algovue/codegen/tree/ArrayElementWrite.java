package algovue.codegen.tree;

public class ArrayElementWrite extends Expression {

    String name;
    Expression index;

    public static ArrayElementWrite builder() {
        return new ArrayElementWrite();
    }

    public ArrayElementWrite name(String name) {
        this.name = name;
        return this;
    }
    public ArrayElementWrite index(Expression index) {
        this.index = index;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.arrItemWrite('" + name + "', " + index.charSequence(0) + ")";
    }
}
