package algovue.codegen.tree;

public interface Node {
    default StringBuilder indent(StringBuilder b, int indent) {
        for (int i = 0; i < indent * 4; i++) {
            b.append(' ');
        }
        return b;
    }
}
