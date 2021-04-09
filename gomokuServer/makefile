
define RAPIDJSON_HAS_STDSTRING
endef
server: server.cpp server.h ./locker/locker.h ./chess/chess.h ./chess/chess.cpp
	g++ -o server server.cpp server.h ./locker/locker.h ./chess/chess.h ./chess/chess.cpp -lwebsockets

clean:
	rm  -r server

