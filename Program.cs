public class Solution {
    public int MaxArea(int[] height)
    {
        int ans = 0;
        int i = 0;
        int j = height.Length - 1;
        while (i < j)
        {
            int h = Math.Min(height[i], height[j]);
            int s = j - i;
            int area = h * s;
            ans = Math.Max(ans, area);
            if (h == height[i])
            {
                i++;
            }

            else
            {
                j--;
            }

        }
        return ans;
    }
}