export interface LoginFrom {
	username: string // 用户名
	password: string // 用户密码
	type: string // 登录类型
}
/**
 * @description: oauth登录需要用到的参数
 * @param socialCode 第三方参数
 * @param socialState 第三方参数
 * @param source 与后端的 justauth.type.xxx的回调地址的source对应
 */
export interface OAuthLoginParams extends BaseLoginParams {
	socialCode: string;
	socialState: string;
	source: string;
}

/**
 * @description: 验证码登录需要用到的参数
 * @param code 验证码 可选(未开启验证码情况)
 * @param uuid 验证码ID 可选(未开启验证码情况)
 * @param username 用户名
 * @param password 密码
 */
export interface SimpleLoginParams extends BaseLoginParams {
	code?: string;
	uuid?: string;
	username: string;
	password: string;
	clientid: string;
}

export type LoginParams = OAuthLoginParams | SimpleLoginParams;

export interface LoginUserInfo {
	userId:bigint;// 用户id
	nickName:string; //用户账号
	avatar:string; // 用户头像
	userBalance:number; // 账户余额
}

export interface UserData {
	token:string; // 登录token
	user:LoninUserInfo; //用户信息
}
