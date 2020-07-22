package algovue.codegen.tree;

public class LineComment extends Statement {

    final String txt;

    public LineComment(String txt) {
        this.txt = txt;
    }
    public LineComment() {
        this(null);
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        b.append("vm.lineComment(");
        if (txt != null) {
            b.append("'").append(txt).append("'");
        }
        b.append(")");
        return b;
    }
}
