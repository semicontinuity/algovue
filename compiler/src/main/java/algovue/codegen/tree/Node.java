package algovue.codegen.tree;

public interface Node {

    CharSequence charSequence(int indent);

    default StringBuilder indent(StringBuilder b, int indent) {
        for (int i = 0; i < indent * 4; i++) {
            b.append(' ');
        }
        return b;
    }

    default String jsString(String s) {
        return s != null ? "'" + s + "'" : "undefined";
    }
}
