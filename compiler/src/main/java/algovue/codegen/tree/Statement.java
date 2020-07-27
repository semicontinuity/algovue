package algovue.codegen.tree;

public abstract class Statement implements Node {

    public abstract CharSequence charSequence(int indent);

    String eolComment;

    public void setEolComment(EolComment eolComment) {
        this.eolComment = eolComment != null ? eolComment.txt : null;
    }
}
