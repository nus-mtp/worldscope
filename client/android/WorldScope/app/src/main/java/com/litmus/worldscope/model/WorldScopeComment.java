package com.litmus.worldscope.model;

// WorldScopeComment model

public class WorldScopeComment {

    private String alias;
    private String content;
    private double createdAt;

    public WorldScopeComment(String alias, String content, Double createdAt) {
        this.alias = alias;
        this.content = content;
        this.createdAt = createdAt;
    }

    public String getAlias() {
        return this.alias;
    }

    public String getContent() {
        return this.content;
    }

    public Double getCreatedAt() {
        return this.createdAt;
    }

    @Override
    public String toString() {
        return this.getAlias() + ": " + this.getContent() + " (" + this.getCreatedAt() + ")";
    }
}