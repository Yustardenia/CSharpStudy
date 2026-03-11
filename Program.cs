public class Solution
{
    public IList<string> LetterCombinations(string digits)
    {
        List<string> ans = new List<string>();
        if (string.IsNullOrEmpty(digits))
        {
            return ans;
        }

        Dictionary<char, string> dict = new Dictionary<char, string>()
        {
            {'2', "abc"},
            {'3', "def"},
            {'4', "ghi"},
            {'5', "jkl"},
            {'6', "mno"},
            {'7', "pqrs"},
            {'8', "tuv"},
            {'9', "wxyz"}
        };

        ans.Add("");

        foreach (char digit in digits)
        {
            string letters = dict[digit];
            List<string> temp = new List<string>();

            foreach (string prefix in ans)
            {
                foreach (char c in letters)
                {
                    temp.Add(prefix + c);
                }
            }

            ans = temp;
        }

        return ans;
    }
}