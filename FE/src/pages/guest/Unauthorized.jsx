import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-md w-full border-border shadow-lg">
        <CardContent className="flex flex-col items-center text-center py-10 px-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Không có quyền truy cập</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Tài khoản của bạn không đủ quyền để xem trang này. Vui lòng đăng nhập bằng tài khoản phù hợp hoặc quay về trang chủ.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button variant="outline" className="flex-1" asChild>
              <Link to={ROUTES.home}>Trang chủ</Link>
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-green-600"
              asChild
            >
              <Link to={ROUTES.login}>Đăng nhập</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { Unauthorized };
