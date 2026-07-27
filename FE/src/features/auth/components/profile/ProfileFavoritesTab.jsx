import { useNavigate, Link, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Package,
  Heart,
  Calendar,
  Leaf,
  Crown,
  Briefcase,
  PenLine,
  Eye,
  EyeOff,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";

function ProfileFavoritesTab({ FAV_PER_PAGE, favLoading, favPage, favTotalPages, favorites, handleUnfavorite, navigate, setFavPage }) {
  return (
<TabsContent value="saved" className="space-y-4">
              {favLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                </div>
              ) : favorites.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="Chưa có cây yêu thích"
                  description="Bạn chưa lưu cây nào. Khám phá và lưu những cây cảnh yêu thích của bạn!"
                  action={{ label: "Khám phá cây cảnh", onClick: () => navigate("/browse") }}
                />
              ) : (
                <>
                  <div className="profile-plants-grid">
                    {favorites
                      .slice((favPage - 1) * FAV_PER_PAGE, favPage * FAV_PER_PAGE)
                      .map((fav, index) => {
                        const plant = fav.plantId;
                        if (!plant) return null;
                        const plantId = plant._id || plant.id;
                        const imageUrl = plant.thumbnail || plant.images?.[0] || "";
                        const savedDate = fav.createdAt
                          ? new Date(fav.createdAt).toLocaleDateString("vi-VN")
                          : "";
                        return (
                          <motion.div key={fav._id || plantId} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                              <div className="aspect-square overflow-hidden relative">
                                <img
                                  src={imageUrl}
                                  alt={plant.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Nút bỏ thích */}
                                <div className="absolute top-3 right-3">
                                  <button
                                    onClick={(e) => handleUnfavorite(plantId, e)}
                                    className="profile-plant-heart-btn"
                                    aria-label="Bỏ yêu thích"
                                  >
                                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                  </button>
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold mb-1">{plant.name}</h3>
                                {plant.scientificName && (
                                  <p className="text-xs text-muted-foreground italic mb-1">{plant.scientificName}</p>
                                )}
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Đã lưu: {savedDate}
                                </p>
                                <Button className="w-full mt-4" variant="outline" asChild>
                                  <Link to={`/plant/${plantId}`}>Xem chi tiết</Link>
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                  </div>
                  {/* === Pagination === */}
                  {!favLoading && favTotalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        disabled={favPage <= 1}
                        onClick={() => setFavPage((p) => p - 1)}
                      >
                        Trước
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: favTotalPages }, (_, i) => i + 1).map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={pageNum === favPage ? "default" : "outline"}
                            size="icon"
                            onClick={() => setFavPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        disabled={favPage >= favTotalPages}
                        onClick={() => setFavPage((p) => p + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
  );
}

export { ProfileFavoritesTab };
