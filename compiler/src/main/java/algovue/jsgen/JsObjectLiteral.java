package algovue.jsgen;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class JsObjectLiteral extends JsLiteral {

    private final Map<String, JsLiteral> elements;

    public JsObjectLiteral(Map<String, JsLiteral> elements) {
        this.elements = elements;
    }

    public JsObjectLiteral() {
        this(new HashMap<>());
    }

    public JsObjectLiteral put(String key, JsLiteral value) {
        elements.put(key, value);
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append('{');
        b.append(elements.entrySet().stream().map(this::stringifyEntry).collect(Collectors.joining(", ")));
        b.append("}");
        return b;
    }

    private CharSequence stringifyEntry(Map.Entry<String, JsLiteral> e) {
        StringBuilder b = new StringBuilder();
        b
                .append('"').append(e.getKey()).append('"')
                .append(':')
                .append(e.getValue().charSequence(0))
        ;
        return b;
    }
}
