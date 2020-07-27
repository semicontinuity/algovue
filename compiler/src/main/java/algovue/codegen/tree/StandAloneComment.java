package algovue.codegen.tree;

public class StandAloneComment extends Statement {

    final String txt;

    public StandAloneComment(String txt) {
        this.txt = txt;
    }
    public StandAloneComment() {
        this(null);
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.standAloneComment(");
        if (txt != null) {
            b.append("'").append(txt).append("'");
        }
        b.append(")");
        return b;
    }
}
