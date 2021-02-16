package algovue.jsgen;

import java.util.Map;
import java.util.stream.Collectors;

public class JsObject extends JsExpression {

    private final Map<String, String> elements;

    public JsObject(Map<String, String> elements) {
        this.elements = elements;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append('{');
        b.append(elements.entrySet().stream().map(this::stringifyEntry).collect(Collectors.joining(", ")));
        b.append("}");
        return b;
    }

    private CharSequence stringifyEntry(Map.Entry<String, String> e) {
        StringBuilder b = new StringBuilder();
        b
                .append('"').append(e.getKey()).append('"')
                .append(':')
                .append('"').append(e.getValue()).append('"')
        ;
        return b;
    }
}
