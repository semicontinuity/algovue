package algovue.jsgen;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class JsArray extends JsExpression {

    private List<JsExpression> elements = new ArrayList<>();


    public static JsArray builder() {
        return new JsArray();
    }


    public JsArray elements(List<JsExpression> elements) {
        this.elements = elements;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append('[');
        b.append(elements.stream().map(p -> p.charSequence(0)).collect(Collectors.joining(", ")));
        b.append("]");
        return b;
    }
}
