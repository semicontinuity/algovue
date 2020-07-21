package algovue.codegen.tree;

public class VarWrite extends Expression {

    String name;
    String targetArray;

    public static VarWrite builder() {
        return new VarWrite();
    }

    public VarWrite name(String name) {
        this.name = name;
        return this;
    }

    public VarWrite targetArray(String a) {
        this.targetArray = a;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append("vm.varWrite('").append(name).append("'");
        if (targetArray != null) {
            b.append(", '").append(targetArray).append("'");
        }
        b.append(")");
        return b;
    }
}
