package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FunctionCall extends Expression {

    private String name;
    private List<Expression> params = new ArrayList<>();


    public static FunctionCall builder() {
        return new FunctionCall();
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
        return "vm.functionCall(" + name + ", ["
                + params.stream().map(p -> p.charSequence(0)).collect(Collectors.joining(", "))
                + "])";
    }
}
