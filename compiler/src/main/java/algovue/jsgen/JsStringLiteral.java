package algovue.jsgen;

public class JsStringLiteral extends JsExpression {

    private final String value;

    public JsStringLiteral(String value) {
        this.value = value;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "\"" + value + "\"";
    }
}
