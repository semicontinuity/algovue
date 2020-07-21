package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ArrayLiteral extends Expression {

    private List<Expression> params = new ArrayList<>();

    public static ArrayLiteral builder() {
        return new ArrayLiteral();
    }

    public ArrayLiteral params(List<Expression> params) {
        this.params = params;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.arrayLiteral(["
                + params.stream().map(p -> p.charSequence(0)).collect(Collectors.joining(", "))
                + "])";
    }
}
