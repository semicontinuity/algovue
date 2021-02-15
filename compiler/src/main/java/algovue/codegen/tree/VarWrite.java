package algovue.codegen.tree;

import java.util.List;
import java.util.stream.Collectors;

import algovue.jsgen.JsArray;
import algovue.jsgen.JsStringLiteral;

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
            b.append(", ");
            b.append(stringifyStringArray(targetArrays));
        }
        b.append(")");
        return b;
    }

    private CharSequence stringifyStringArray(List<String> targetArrays) {
        return JsArray.builder()
                .elements(targetArrays.stream().map(JsStringLiteral::new).collect(Collectors.toList()))
                .charSequence(0);
    }
}
