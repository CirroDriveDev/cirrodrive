export const Symbols = {
  Logger: Symbol.for("Logger"),
  DayJS: Symbol.for("DayJS"),
  UserModel: Symbol.for("UserModel"),
  SessionModel: Symbol.for("SessionModel"),
  FileMetadataModel: Symbol.for("FileMetadataModel"),
  FolderModel: Symbol.for("FolderModel"),
  FileAccessCodeModel: Symbol.for("FileAccessCodeModel"),
  VerificationCodeModel: Symbol("VerificationCodeModel"),
  // 더 이상 모델을 여기에 추가하지 마세요.
  // 모델 심볼 대신 레포지토리 클래스를 직접 사용하세요.
};
