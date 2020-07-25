package algovue.codegen.tree;

import java.util.List;
import java.util.stream.Collectors;

public class VarWrite extends Expression {

    String name;
    List<String> targetArrays;

    public static VarWrite builder() {
        return new VarWrite();
    }

    public VarWrite name(String name) {
        this.name = name;
        return this;
    }

    public VarWrite targetArrays(List<String> a) {
        this.targetArrays = a;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append("vm.varWrite('").append(name).append("'");
        if (targetArrays != null) {
            b.append(", [").append(targetArrays.stream().map(this::jsString).collect(Collectors.joining(", "))).append("]");
        }
        b.append(")");
        return b;
    }
}
