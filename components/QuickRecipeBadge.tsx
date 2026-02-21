'use client';

interface QuickRecipeBadgeProps {
  menuName: string;
  menuDatabase: any[];
}

export default function QuickRecipeBadge({ menuName, menuDatabase }: QuickRecipeBadgeProps) {
  const menuItem = menuDatabase.find((m: any) => m.name === menuName);
  const quickRecipes = menuItem?.quickRecipes || [];
  const randomRecipe = quickRecipes.length > 0 
    ? quickRecipes[Math.floor(Math.random() * quickRecipes.length)]
    : null;
  
  // 태그 후보
  const allTags = [
    '🧊 냉장고 털이',
    '🍳 초간단',
    '🧼 설거지 적음',
    '🔥 1팬/1냄비',
    '🥚 단백질 OK',
    '🌶️ 매콤 가능',
    '🧂 간단 양념'
  ];
  
  // 랜덤 2개 선택
  const shuffled = [...allTags].sort(() => Math.random() - 0.5);
  const selectedTags = shuffled.slice(0, 2);
  
  return (
    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-3xl">⏱️</span>
        <div>
          <h3 className="text-2xl font-bold text-green-800">5분컷</h3>
          <p className="text-sm text-green-600">냉장고 재료로 바로 만들어먹기</p>
        </div>
      </div>
      
      {/* 태그 2개 */}
      <div className="flex gap-2 justify-center flex-wrap">
        {selectedTags.map((tag, idx) => (
          <span 
            key={idx}
            className="px-3 py-1.5 bg-white/80 rounded-full text-sm font-medium text-green-700 border border-green-200"
          >
            {tag}
          </span>
        ))}
      </div>
      
      {/* 한 줄 레시피 */}
      {randomRecipe && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <p className="text-sm text-green-700 font-medium text-center">
            💡 <span className="font-bold">한 줄 레시피:</span> {randomRecipe}
          </p>
        </div>
      )}
    </div>
  );
}
