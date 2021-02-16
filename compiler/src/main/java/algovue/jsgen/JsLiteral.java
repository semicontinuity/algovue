package algovue.jsgen;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public abstract class JsLiteral extends JsExpression {

    public static JsLiteral of(Object value) {
        if (value == null) {
            return new JsNullLiteral();
        } else if (value instanceof String) {
            return new JsStringLiteral((String) value);
        } else if (value instanceof Map) {
            JsObjectLiteral mapLiteral = new JsObjectLiteral();
            Map<String, ?> map = (Map<String, ?>) value;
            for (Map.Entry<String, ?> entry : map.entrySet()) {
                mapLiteral.put(entry.getKey(), of(entry.getValue()));
            }
            return mapLiteral;
        } else if (value instanceof List) {
            List<?> list = ((List<?>) value);
            return JsArrayLiteral.builder()
                    .elements(list.stream().map(JsLiteral::of).collect(Collectors.toList()));
        } else {
            throw new IllegalArgumentException();
        }
    }
}
