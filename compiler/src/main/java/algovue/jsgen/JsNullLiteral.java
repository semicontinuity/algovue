package algovue.jsgen;

public class JsNullLiteral extends JsLiteral {

    @Override
    public CharSequence charSequence(int indent) {
        return "null";
    }
}
