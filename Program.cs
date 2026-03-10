public class Solution
{
    public IList<IList<int>> ThreeSum(int[] nums)
    {
        Array.Sort(nums);
        IList<IList<int>> ans = new List<IList<int>>();
        for (int i = 0; i < nums.Length - 2; i++)
        {
            if (nums[i] > 0)
            {
                break;
            }

            if (i > 0 && nums[i] == nums[i-1])
            {
                continue;
            }

            int left = i + 1;
            int right = nums.Length - 1;
            while (left < right)
            {
                if (nums[i] + nums[left] + nums[right] == 0)
                {
                    ans.Add(new List<int>()
                    {
                        nums[i],nums[left],nums[right]
                    });
                    left++;
                    right--;
                    while (left < right && nums[left] == nums[left-1])
                    {
                        left++;
                    }
                    while(left < right && nums[right] == nums[right+1])
                    {
                        right--;
                    }
                }

                else if (nums[i] + nums[left] + nums[right] < 0)
                {
                    left++;
                }

                else 
                {
                    right--;
                }
            }
        }
        
        return ans;
    }
}