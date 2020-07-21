package algovue.codegen.tree;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FunctionDeclaration extends Declaration {
    private List<String> params = new ArrayList<>();
    private Statement body;

    public static FunctionDeclaration builder() {
        return new FunctionDeclaration();
    }

    public FunctionDeclaration name(String name) {
        this.name = name;
        return this;
    }

    public FunctionDeclaration params(List<String> params) {
        this.params = params;
        return this;
    }

    public FunctionDeclaration body(Statement body) {
        this.body = body;
        return this;
    }


    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append("vm.functionDeclaration(").append('\n');
        indent(b, indent).append("'").append(name).append("',\n");
        indent(b, indent)
                .append('[')
                .append(params.stream().map(p -> "vm.variable('" + p + "')").collect(Collectors.joining(", ")))
                .append("],\n");
        b.append(body.charSequence(indent)).append('\n');
        b.append(")");
        return b;
    }
}
