package algovue.codegen.tree;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import algovue.jsgen.JsArrayLiteral;
import algovue.jsgen.JsLiteral;
import algovue.jsgen.JsStringLiteral;

public class VarWrite extends Expression {

    String name;
    List<?> targetArrays;
    Map<String, Object> metaData;

    public static VarWrite builder() {
        return new VarWrite();
    }

    public VarWrite name(String name) {
        this.name = name;
        return this;
    }

    public VarWrite metaData(Map<String, Object> m) {
        this.metaData = m;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append("vm.varWrite('").append(name).append("'");
        if (targetArrays != null) {
            b.append(", ");
            b.append(stringifyStringArray(targetArrays));
        } else if (metaData != null) {
            b.append(", ");
            b.append(stringifyMap(metaData));
        }
        b.append(")");
        return b;
    }

    private CharSequence stringifyStringArray(List<?> targetArrays) {
        return JsLiteral.of(targetArrays).charSequence(0);
    }

    private CharSequence stringifyMap(Map<String, Object> m) {
        return JsLiteral.of(m).charSequence(0);
    }
}
