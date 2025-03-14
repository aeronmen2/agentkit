# -*- coding: utf-8 -*-
# mypy: disable-error-code="attr-defined"
import asyncpg
from fastapi import APIRouter
from fastapi_cache.decorator import cache

from app.db.session import sql_tool_db
from app.schemas.response_schema import IGetResponseBase, create_response
from app.schemas.tool_schemas.sql_tool_schema import ExecutionResult
from app.utils.sql import is_sql_query_safe

router = APIRouter()

# Création d'un pool de connexions global
async def init_db_pool():
    return await asyncpg.create_pool(
        dsn=sql_tool_db.dsn,
        min_size=1,
        max_size=10,
    )

db_pool = None

@router.on_event("startup")
async def startup_event():
    global db_pool
    db_pool = await init_db_pool()

@router.get("/execute")
@cache(expire=600)  # -> Bug on POST requests https://github.com/long2ice/fastapi-cache/issues/113
async def execute_sql(
    statement: str,
) -> IGetResponseBase[ExecutionResult]:
    """Executes an SQL query on the database and returns the result."""
    if not is_sql_query_safe(statement):
        return create_response(
            message="SQL query contains forbidden keywords (DML, DDL statements)",
            data=None,
            meta={},
        )
    if db_pool is None:
        return create_response(
            message="SQL query execution is disabled",
            data=None,
            meta={},
        )

    try:
        async with db_pool.acquire() as connection:
            async with connection.transaction():
                prepared_stmt = await connection.prepare(statement)
                rows = await prepared_stmt.fetch()
                columns = [desc[0] for desc in prepared_stmt.get_attributes()]

        execution_result = ExecutionResult(
            raw_result=[dict(zip(columns, row)) for row in rows],
            affected_rows=None,
            error=None,
        )
    except Exception as e:
        return create_response(
            message=repr(e),
            data=None,
        )

    return create_response(
        message="Successfully executed SQL query",
        data=execution_result,
    )
