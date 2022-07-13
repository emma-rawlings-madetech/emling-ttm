package com.emling.ttm

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.persistence.Version

@Entity
open class TabletopSystem constructor(
    private var name: String,
    private var description: String,
    // TODO Is it appropriate, in kotlin, to allow this field to be null solely to support the empty constructor? Is there a good alternative?
    @ManyToOne
    private var author: User?
) {
    @Id
    @GeneratedValue
    private var id: Long? = null

    @Version
    @JsonIgnore
    private var version: Long? = null

    protected constructor() : this("", "", null)

    open fun getId(): Long? {
        return id
    }

    open fun setId(id: Long?) {
        this.id = id
    }

    open fun getName(): String {
        return name
    }

    open fun setName(name: String) {
        this.name = name
    }

    open fun getDescription(): String {
        return description
    }

    open fun setDescription(description: String) {
        this.description = description
    }

    open fun getVersion(): Long? {
        return version
    }

    open fun setVersion(version: Long?) {
        this.version = version
    }

    open fun getAuthor(): User? {
        return author
    }

    open fun setAuthor(author: User?) {
        this.author = author
    }

    override fun equals(other: Any?): Boolean {
        // TODO '==='?
        if (this === other) return true
        if (other == null || javaClass != other.javaClass) return false
        val system: TabletopSystem = other as TabletopSystem
        return Objects.equals(id, system.id) &&
                Objects.equals(name, system.name) &&
                Objects.equals(description, system.description) &&
                Objects.equals(version, system.version) &&
                Objects.equals(author, system.author)
    }

    override fun hashCode(): Int {
        return Objects.hash(id, name, description, version, author)
    }

    override fun toString(): String {
        // TODO toString builder?
        return "TabletopSystem{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", version='" + version + '\'' +
                ", author='" + author + '\'' +
                '}'
    }
}