

## HoitGoMoKu

​	**A type of GoMoKu(Connect-5)** 

 

### API List

#### 	Interface Type: websocket

#### 	

| 分组 | API名称      | 描述         |
| ---- | ------------ | ------------ |
| 房间 | Create Room  | 创建房间     |
|      | Join Room    | 加入房间     |
|      | Escape       | 离开房间     |
|      | Type Room    | 查看房间列表 |
| 游戏 | Start Game   | 开始游戏     |
|      | Move Chess   | 下棋         |
|      | Restart Game | 重启         |



### API Description 

#### 		Create Room

##### 				Request(json)

```json
{
    	Type:0
        Title: "happy_game"
        Desc: "This is a happy game"
        Username: "ZTl"
}
```

| 变量名   | 描述     | 示例                 |
| -------- | -------- | -------------------- |
| Type     | 消息类型  | 0为创建房间          |
| Title    | 房间名   | happy_game           |
| Desc     | 房间描述 | This is a happy game |
| Username | 用户名   | ZTl                  |



##### 				Response(json)
```json
{
        Type: 5
        RoomList: 
        {
            {
                RoomId:1
                RoomTitle:"happy_game"
                RoomDesc:"This is a happy game"
            },
            ...
        }
}
```
| 变量名   | 描述     | 示例                 |
| -------- | -------- | -------------------- |
| Type     | 消息类型  | 5为房间信息列表          |



#### 		Join Room

##### 				Request(json)

```json
 {
     	Type: 1
        RoomId: 1
        Username: "ZTl"
 }
```

| 变量名   | 描述    | 示例        |
| -------- | ------- | ----------- |
| Type     | 消息类型 | 1为加入房间 |
| RoomId   | 房间ID  | 1           |
| Username | 用户名  | ZTl         |

##### 				Response
**if room is full**
```json
{
        Type: 2
}
```
| 变量名   | 描述    | 示例        |
| -------- | ------- | ----------- |
| Type     | 消息类型 | 2为游戏开始 |



#### 	Start Game

##### 		Request(json)

```json
 {
 		Type:2
        Opponentname: "Zhangsan"
        Youfirst:  true or false
 }
```

| 变量名       | 描述         | 示例        |
| ------------ | ------------ | ----------- |
| Type         | 消息类型      | 2为开始游戏 |
| Opponentname | 队友名称     | Zhangsan    |
| Youfirst     | 房主先手标志 | true        |



##### 				Response
```json
 {
 	Type:2
 }
```
**To another player**
| 变量名       | 描述         | 示例        |
| ------------ | ------------ | ----------- |
| Type         | 消息类型      | 2为开始游戏 |




#### 	Move Chess

##### 		Request(json)

```json
{
		Type: 3
        X: x
        Y: y
}
```

| 变量名 | 描述    | 示例        |
| ------ | ------- | ----------- |
| Type   | 消息类型 | 3为棋子消息 |
| X      | 横坐标  | 2           |
| Y      | 纵坐标  | 3           |



##### 		Response(json)
**To another player**
```json
{
		Type: 3
        X: x
        Y: y
}
```
| 变量名 | 描述    | 示例        |
| ------ | ------- | ----------- |
| Type   | 消息类型 | 3为对手棋子消息 |
| X      | 横坐标  | 2           |
| Y      | 纵坐标  | 3           |



#### 	Escape

##### 		Request(json)

```json
{
        Type: 4
}
```

| 变量名 | 描述    | 示例        |
| ------ | ------- | ----------- |
| Type   | 消息类型 | 4为退出游戏 |


##### 		Response(json)
**To another player**
```json
{
        Type: 4
}
```

| 变量名 | 描述    | 示例        |
| ------ | ------- | ----------- |
| Type   | 消息类型 | 4为对手退出游戏 |



#### 		Type Room

##### 				Request(json)
```json
{
        Type: 5
}
```
| 变量名 | 描述    | 示例        |
| ------ | ------- | ----------- |
| Type   | 消息类型 | 5为打印房间列表 |

##### 		Response
```json
{
        Type: 5
        RoomList: 
        {
            {
                RoomId:1
                RoomTitle:"happy_game"
                RoomDesc:"This is a happy game"
            },
            ...
        }
}
```
| 变量名    | 描述     | 示例                 |
| --------- | -------- | -------------------- |
| RoomList  | 房间列表 |                      |
| RoomId    | 房间ID   | 1                    |
| RoomTitle | 房间名   | happy_game           |
| RoomDesc  | 房间描述 | This is a happy game |



#### 	Reset Game

##### 		Request(json)

```json
{
        Type: 6
}
```

| 变量名 | 描述    | 示例        |
| ------ | ------- | ----------- |
| Type   | 消息类型 | 6为重启游戏 |


##### 		Response
**if room is full**
```json
 {
 	Type:2
 }
```
| 变量名       | 描述         | 示例        |
| ------------ | ------------ | ----------- |
| Type         | 消息类型      | 2为开始游戏 |
