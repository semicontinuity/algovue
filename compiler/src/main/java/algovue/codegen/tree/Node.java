package algovue.codegen.tree;

public interface Node {

    default StringBuilder stringBuilder(int indent) {
        return indent(new StringBuilder(), indent);
    }

    CharSequence charSequence(int indent);

    default StringBuilder indent(StringBuilder b, int indent) {
        indented(b, indent);
        return b;
    }

    static void indented(StringBuilder b, int indent) {
        for (int i = 0; i < indent * 4; i++) {
            b.append(' ');
        }
    }

    default String jsString(String s) {
        return s != null ? "'" + s + "'" : "undefined";
    }
}
