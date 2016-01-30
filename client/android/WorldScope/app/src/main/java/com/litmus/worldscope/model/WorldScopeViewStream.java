package com.litmus.worldscope.model;

/**
 * Stream object model returned from WorldScope App Server for viewing of streams
 */
public class WorldScopeViewStream extends WorldScopeStream{
    private String viewLink;
    private String thumbnailLink;

    public String getViewLink() {return viewLink;}
    public String getThumbnailLink() {return thumbnailLink;}

    public void setViewLink(String viewLink) {this.viewLink = viewLink;}
    public void setThumbnailLink(String thumbnailLink) {this.thumbnailLink = thumbnailLink;}

    @Override
    public String toString() {
        return this.toString() + "\n"
                + "viewLink: " + this.getViewLink()
                + "thumbnailLink: " + this.getThumbnailLink();
    }

}
