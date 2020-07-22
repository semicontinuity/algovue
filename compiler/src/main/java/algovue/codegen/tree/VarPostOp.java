package algovue.codegen.tree;

public class VarPostOp extends Expression {

    String name;
    boolean increment;

    public static VarPostOp builder() {
        return new VarPostOp();
    }

    public VarPostOp name(String name) {
        this.name = name;
        return this;
    }

    public VarPostOp increment(boolean increment) {
        this.increment = increment;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append("vm.varPostOp('").append(name).append("', ").append(increment).append(")");
        return b;
    }
}
