package algovue.jsgen;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class JsArrayLiteral extends JsLiteral {

    private List<JsLiteral> elements = new ArrayList<>();


    public static JsArrayLiteral builder() {
        return new JsArrayLiteral();
    }


    public JsArrayLiteral elements(List<JsLiteral> elements) {
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
