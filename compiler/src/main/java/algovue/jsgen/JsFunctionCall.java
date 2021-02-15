package algovue.jsgen;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class JsFunctionCall extends JsExpression {

    private String object;
    private String method;
    private List<JsExpression> params = new ArrayList<>();


    public static JsFunctionCall builder() {
        return new JsFunctionCall();
    }

    public JsFunctionCall object(String object) {
        this.object = object;
        return this;
    }

    public JsFunctionCall method(String method) {
        this.method = method;
        return this;
    }

    public JsFunctionCall params(List<JsExpression> params) {
        this.params = params;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append(object).append('.').append(method).append('(');
        b.append(params.stream().map(p -> p.charSequence(0)).collect(Collectors.joining(", ")));
        b.append(")");
        return b;
    }
}
