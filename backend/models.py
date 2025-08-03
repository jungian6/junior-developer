from pydantic import BaseModel

class Source(BaseModel):
    id: str
    title: str
    source: str
    favicon: str

class Data(BaseModel):
    category: str
    cited_sources: list[Source]
    non_cited_sources: list[Source]
    content: str