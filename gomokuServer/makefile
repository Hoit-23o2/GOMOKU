
define RAPIDJSON_HAS_STDSTRING
endef
server: server.cpp server.h ./sql_connection/sql_connection_pool.h ./sql_connection/sql_connection_pool.cpp ./locker/locker.h ./chess/chess.h ./chess/chess.cpp
	g++ -o server server.cpp server.h ./sql_connection/sql_connection_pool.h ./sql_connection/sql_connection_pool.cpp ./locker/locker.h ./chess/chess.h ./chess/chess.cpp -lwebsockets -lpthread -lmysqlclient

clean:
	rm  -r server

