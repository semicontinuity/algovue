package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FunctionCall extends Expression {

    private String self;
    private String name;
    private List<Expression> params = new ArrayList<>();


    public static FunctionCall builder() {
        return new FunctionCall();
    }

    public FunctionCall self(String self) {
        this.self = self;
        return this;
    }

    public FunctionCall name(String name) {
        this.name = name;
        return this;
    }

    public FunctionCall params(List<Expression> params) {
        this.params = params;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        if (self != null) {
            b.append("vm.functionCall('").append(name).append("', [");
            b.append(params.stream().map(p -> p.charSequence(0)).collect(Collectors.joining(", ")));
            b.append("]");
            b.append(", '").append(self).append("'");
        } else {
            b.append("vm.functionCall(").append(name).append(", [");
            b.append(params.stream().map(p -> p.charSequence(0)).collect(Collectors.joining(", ")));
            b.append("]");
        }
        b.append(")");
        return b;
    }
}
