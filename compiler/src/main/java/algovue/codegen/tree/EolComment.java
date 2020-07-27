package algovue.codegen.tree;

public class EolComment extends Statement {

    final String txt;

    public EolComment(String txt) {
        this.txt = txt;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.eolComment(");
        if (txt != null) {
            b.append("'").append(txt).append("'");
        }
        b.append(")");
        return b;
    }
}
